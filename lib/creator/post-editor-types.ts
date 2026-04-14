export type PostEditorFormValues = {
  title: string;
  body: string;
  /** Hero / card image; stored URL after Pinata upload */
  coverImageUrl: string;
  audience: "free" | "paid";
  minTierId: string;
  /** Collection ids (as strings) this post appears in; empty = none */
  collectionIds: string[];
};
