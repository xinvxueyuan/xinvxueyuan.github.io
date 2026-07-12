import { ClawCaptcha, type ToyId } from "playcaptcha";

interface CaptchaUnlockProps {
  target?: ToyId;
}

export default function CaptchaUnlock({ target }: CaptchaUnlockProps) {
  return (
    <ClawCaptcha
      target={target}
      onVerify={() => {
        window.dispatchEvent(new CustomEvent("captcha:verified"));
      }}
    />
  );
}
