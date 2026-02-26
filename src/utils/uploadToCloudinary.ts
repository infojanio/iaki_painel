// src/utils/uploadToCloudinary.ts
import axios from "axios";

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "products"); // Defina no Cloudinary
  formData.append("folder", "produtos"); // opcional: cria uma pasta

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/dwqr47iii/image/upload`,
    formData
  );

  return response.data.secure_url;
}
