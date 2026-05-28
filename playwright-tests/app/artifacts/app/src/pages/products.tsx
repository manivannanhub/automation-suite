import { useState } from "react";
import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Tag } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

type SortBy = "name" | "price";
type SortOrder = "asc" | "desc";

const placeholderProducts = [
  {
    id: 1,
    name: "Wireless Keyboard",
    price: 7999,
    category: "Hardware",
    description: "Low-profile wireless input for focused command work.",
  },
  {
    id: 2,
    name: "Wireless Mouse",
    price: 4999,
    category: "Hardware",
    description: "Responsive pointer with multi-device pairing.",
  },
  {
    id: 3,
    name: "Command Console",
    price: 12999,
    category: "Hardware",
    description: "A compact control surface for daily operations.",
  },
  {
    id: 4,
    name: "Signal Desk",
    price: 8999,
    category: "Software",
    description: "Team dashboard tooling with alerts and shared notes.",
  },
];

export default function Products() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const { data: products = placeholderProducts, isLoading } = useListProducts({
    search: debouncedSearch || undefined,
    sortBy,
    sortOrder,
  }, {
    query: {
      queryKey: getListProductsQueryKey({ search: debouncedSearch, sortBy, sortOrder })
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Browse our catalog</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-none shadow-sm"
              data-testid="product-search"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortBy)}
              className="h-9 w-full rounded-md bg-card px-3 text-sm shadow-sm sm:w-[130px]"
              data-testid="select-sort-by"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
            </select>

            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
              className="h-9 w-[88px] rounded-md bg-card px-3 text-sm shadow-sm"
              data-testid="select-sort-order"
              aria-label="Sort order"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && products.length === 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-none shadow-sm">
              <div className="h-48 bg-muted rounded-t-xl" />
              <CardHeader className="py-4">
                <div className="h-6 w-3/4 bg-muted rounded mb-2" />
                <div className="h-4 w-1/4 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full bg-muted rounded mb-2" />
                <div className="h-4 w-2/3 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed rounded-xl border-muted bg-card/50">
          <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground">
            {search ? "Try adjusting your search terms." : "The catalog is currently empty."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className="border-none shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden bg-card flex flex-col"
              data-testid={`product-card-${product.id}`}
            >
              <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                <PackageIcon className="h-20 w-20 text-primary/20 group-hover:scale-110 transition-transform duration-500" />
                <Badge className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/80">
                  {product.category}
                </Badge>
              </div>
              <CardHeader className="py-4 pb-2">
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    <span data-product-name>{product.name}</span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 py-0 pb-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </CardContent>
              <CardFooter className="pt-4 border-t bg-muted/10">
                <div className="text-2xl font-bold text-foreground">
                  ${(product.price / 100).toFixed(2)}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PackageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
