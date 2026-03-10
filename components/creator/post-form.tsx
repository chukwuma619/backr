"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TiptapPostEditor } from "@/components/creator/tiptap-post-editor";

import type { Post } from "@/lib/db/schema";
import { toast } from "sonner";
import { updatePost } from "@/app/actions/post";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Content is required").max(50000),
  status: z.enum(["draft", "published"]),
});

type FormValues = z.infer<typeof formSchema>;

type PostFormProps = {
  post: Post;
};

export function PostForm({ post }: PostFormProps) {


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
          title: post?.title ?? "",
          body: post?.content ?? "",
          status: (post?.status as "draft" | "published") ?? "draft",
        }
  });

  const status = useWatch({ control: form.control, name: "status" });



  async function onSubmit(values: FormValues) {

      const formData = new FormData();
      formData.set("title", values.title.trim());
      formData.set("body", values.body.trim());
      formData.set("status", values.status);

      const { data, error } = await updatePost(post?.id, formData);

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data) {
        toast.success("Post updated successfully");
      }

  
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <Card>
          <CardContent className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Post title"
                      className="text-lg font-medium"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <TiptapPostEditor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder="Content..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Saving…"
                  : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
