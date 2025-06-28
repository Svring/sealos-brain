import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  fields: [
    {
      name: "username",
      type: "text",
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "role",
      type: "select",
      options: ["admin", "user"],
    },
    {
      name: "tokens",
      type: "array",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          admin: {
            description:
              "Unique name for this token (e.g., kubeconfig, region_token, app_token)",
          },
        },
        {
          name: "value",
          type: "text",
          required: true,
          admin: {
            description: "The token value",
          },
        },
        {
          name: "type",
          type: "select",
          options: [
            { label: "Kubeconfig", value: "kubeconfig" },
            { label: "Region Token", value: "region_token" },
            { label: "App Token", value: "app_token" },
            { label: "Custom", value: "custom" },
            { label: "Devbox Token", value: "devbox_token" },
            { label: "API Key", value: "api_key" },
            { label: "Base URL", value: "base_url" },
          ],
          defaultValue: "custom",
          admin: {
            description: "Type of token for categorization",
          },
        },
      ],
    },
  ],
};
