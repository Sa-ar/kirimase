import { consola } from "consola";
import { execa } from "execa";
import { existsSync } from "fs";
import {
  addPackageToConfig,
  installPackages,
  installShadcnUIComponents,
  pmInstallCommand,
  readConfigFile,
  replaceFile,
} from "@/utils.js";
import { AvailablePackage } from "@/types.js";
import { addContextProviderToLayout } from "../utils.js";

export const installShadcnUI = async (packages: AvailablePackage[]) => {
  consola.start("Installing Shadcn UI...");
  const { preferredPackageManager } = readConfigFile();
  const filePath = "components.json";

  installPackages(
    { regular: "lucide-react", dev: "" },
    preferredPackageManager
  );
  const baseArgs = ["shadcn-ui@latest", "init"];
  const installArgs =
    preferredPackageManager === "pnpm" ? ["dlx", ...baseArgs] : baseArgs;

  if (existsSync(filePath)) {
    consola.info("Shadcn is already installed. Adding Shadcn UI to config...");
    addPackageToConfig("shadcn-ui");
  } else {
    try {
      await execa(pmInstallCommand[preferredPackageManager], installArgs, {
        stdio: "inherit",
      });
      consola.success("Shadcn initialized successfully.");
      addPackageToConfig("shadcn-ui");
    } catch (error) {
      consola.error(`Failed to initialize Shadcn: ${error.message}`);
    }
  }
  await installShadcnUIComponents(["button", "toast"]);
  addContextProviderToLayout("ShadcnToast");
  if (packages.includes("next-auth")) updateSignInComponentWithShadcnUI();
};

export const updateSignInComponentWithShadcnUI = () => {
  const { hasSrc } = readConfigFile();
  const filepath = "components/auth/SignIn.tsx";
  const updatedContent = `"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "../ui/button";

export default function SignIn() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;

  if (session) {
    return (
      <>
        Signed in as {session.user?.email} <br />
        <Button variant={"destructive"} onClick={() => signOut()}>Sign out</Button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <Button onClick={() => signIn()}>Sign in</Button>
    </>
  );
}`;
  replaceFile(`${hasSrc ? "src/" : ""}${filepath}`, updatedContent);
};
