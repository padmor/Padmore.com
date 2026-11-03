import Image from "next/image";
import signinPicture from "@/features/auth/assets/signin-connect.jpg";

// The picture beside the sign-in, sign-up and password forms.
export function AuthPhoto() {
  return <div className="auth-photo"><Image src={signinPicture} alt="A developer at their desk, connecting with people online" fill placeholder="blur" sizes="(max-width: 900px) 90vw, 560px" loading="eager"/></div>;
}
