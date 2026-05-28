import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSubmitContact } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Send, CheckCircle } from "lucide-react";
import { useState } from "react";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function Contact() {
  const submitMutation = useSubmitContact();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof contactSchema>) {
    submitMutation.mutate(
      { data: values },
      {
        onSuccess: () => {
          setIsSuccess(true);
          form.reset();
        },
      }
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contact Support</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Need help? Reach out and we'll get back to you as soon as possible.
        </p>
      </div>

      <Card className="border-none shadow-xl bg-card">
        <CardContent className="p-6 sm:p-10">
          {isSuccess && (
            <div className="flex flex-col items-center justify-center text-center py-10 animate-in zoom-in-95 duration-300" data-testid="success-banner">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
              <p className="text-muted-foreground mb-8 max-w-sm">
                Thanks for reaching out. Our support team will review your message and respond shortly.
              </p>
              <Button onClick={() => setIsSuccess(false)} variant="outline">
                Send another message
              </Button>
            </div>
          )}
          {!isSuccess && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="contact-form">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} className="h-12 bg-muted/30" data-testid="input-contact-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} className="h-12 bg-muted/30" data-testid="input-contact-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How can we help you today?" 
                          className="min-h-[160px] resize-none bg-muted/30 text-base p-4" 
                          {...field} 
                          data-testid="input-contact-message" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full sm:w-auto mt-4 px-8 text-base"
                  disabled={submitMutation.isPending}
                  data-testid="button-submit-contact"
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-5 w-5" />
                  )}
                  Send Message
                </Button>
              </form>
            </Form>
          )}
          {isSuccess && (
            <div className="sr-only">
              <Input data-testid="input-contact-name" value={form.getValues("name")} readOnly />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
