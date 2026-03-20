export type PostEditorFormValues = {
  title: string;
  body: string;
  audience: "free" | "paid";
  minTierId: string;
  /** Collection ids (as strings) this post appears in; empty = none */
  collectionIds: string[];
};
