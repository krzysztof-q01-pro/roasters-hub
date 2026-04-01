import { UTApi } from "uploadthing/server";

const utapi = new UTApi();
const PLACEHOLDER_URL = "https://teatr-rampa.pl/wp-content/uploads/2022/06/fot_Bartek_Warzecha_%C2%A9_DSCF3508-1-1440x960.jpg";

async function main() {
  console.log("Fetching placeholder image...");
  const res = await fetch(PLACEHOLDER_URL);
  const buffer = await res.arrayBuffer();
  const file = new File([buffer], "cafe-placeholder.jpg", { type: "image/jpeg" });
  
  console.log("Uploading to Uploadthing...");
  const result = (await utapi.uploadFiles([file]))[0];
  
  if (result.error) {
    console.error("Upload failed:", result.error.message);
    process.exit(1);
  }
  
  const url = result.data.ufsUrl ?? result.data.url;
  console.log("\n--- UPLOADTHING URL ---");
  console.log(url);
  console.log("--- END ---");
}

main().catch(console.error);