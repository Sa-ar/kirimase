import { AvailablePackage } from "@/types.js";
import { readConfigFile, replaceFile } from "@/utils.js";
import fs from "fs";

export const Packages: { name: string; value: AvailablePackage }[] = [
  { name: "Drizzle", value: "drizzle" },
  { name: "TRPC", value: "trpc" },
  { name: "Auth.js (NextAuth)", value: "next-auth" },
  { name: "Shadcn UI", value: "shadcn-ui" },
];

export const addContextProviderToLayout = (
  provider: "NextAuthProvider" | "TrpcProvider" | "ShadcnToast"
) => {
  const { hasSrc } = readConfigFile();
  const path = `${hasSrc ? "src/" : ""}app/layout.tsx`;

  const fileContent = fs.readFileSync(path, "utf-8");

  // Add import statement after the last import
  const importInsertionPoint = fileContent.lastIndexOf("import");
  const nextLineAfterLastImport =
    fileContent.indexOf("\n", importInsertionPoint) + 1;
  const beforeImport = fileContent.slice(0, nextLineAfterLastImport);
  const afterImport = fileContent.slice(nextLineAfterLastImport);

  let importStatement: string;
  switch (provider) {
    case "NextAuthProvider":
      importStatement = `import NextAuthProvider from "@/lib/auth/Provider";`;
      break;
    case "TrpcProvider":
      importStatement = `import TrpcProvider from "@/lib/trpc/Provider";`;
      break;
    case "ShadcnToast":
      importStatement = `import { Toaster } from "@/components/ui/toaster";`;
      break;
  }

  const modifiedImportContent = `${beforeImport}${importStatement}\n${afterImport}`;

  const newLayoutContent =
    provider === "ShadcnToast"
      ? modifiedImportContent.replace("{children}", "{children}\n<Toaster />\n")
      : modifiedImportContent.replace(
          "{children}",
          `\n<${provider}>{children}</${provider}>\n`
        );
  replaceFile(path, newLayoutContent);
};
