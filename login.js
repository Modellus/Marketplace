const apiBase = "https://modellus-api.interactivebook.workers.dev";
const googleClientId = "616832441203-a45kghte7c05vdkj5ri5ejp8qu81vcae.apps.googleusercontent.com";
const sessionKey = "mp.session";
if (typeof DevExpress !== "undefined" && DevExpress.config) DevExpress.config({ licenseKey: 'LCPv1,L,!9RS;S>Eo2QRg!L,;c<@@(JQJ(H3[3<987%m;pJ-7%e91V7a+GJ447Y:B2QaF!bSBVi:y3iSV6yXyIJtE%jaKVN,G9_,Hey!NpR-8!bt@(HR$V<9[,pmNZ+Ez:Htjp7+pInt>,7Dn>Q,N,na+:et3IJy(c_+z3<V;I+-6%<m:pj,$eJcmk%9<%pFE>jy:%%!<SQFQpK-EpR+FIb<;6%f;>Qd$pN-:>%X<2p@6p<-Q2%d:2bRQ>Q!vI<!F2_@FG<-6p<dQI%!:aQ!)27@QI%4v>jzvaj@Fp<4vI%!62<X<!j@:>Q4:G_@@9Qdv6<!F6<dFI7yFI7yFI7Ll' });

class LoginApp {
  constructor() {
    this.elements = {
      status: document.getElementById("login-status"),
      googleButtonHost: document.getElementById("google-signin")
    };
    this.restoreSession();
    this.initGoogle();
  }
  restoreSession() {
    const stored = localStorage.getItem(sessionKey);
    if (stored) window.location.href = "/models.html";
  }
  setStatus(message, isError = false) {
    this.elements.status.textContent = message || "";
    this.elements.status.classList.toggle("error", Boolean(isError));
  }
  onGoogleCredential(response) {
    const idToken = response && response.credential;
    if (!idToken) this.setStatus("Google sign-in failed. No credential returned.", true);
    if (!idToken) return;
    this.exchangeGoogleToken(idToken);
  }
  async exchangeGoogleToken(idToken) {
    this.setStatus("Signing you in…");
    try {
      const response = await fetch(`${apiBase}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });
      if (!response.ok) throw new Error(`Auth failed (${response.status})`);
      const data = await response.json();
      const token = data && data.token ? data.token : idToken;
      const user = data && data.user ? data.user : {};
      const session = {
        token,
        name: user.name || user.givenName || "Signed in",
        email: user.email || "",
        userId: user.id || user.user_id || user.userId || user.sub || ""
      };
      localStorage.setItem(sessionKey, JSON.stringify(session));
      this.setStatus("");
      window.location.href = "/models.html";
    } catch (error) {
      this.setStatus(error && error.message ? error.message : "Google sign-in failed.", true);
    }
  }
  initGoogle() {
    if (!googleClientId) this.setStatus("Missing GOOGLE_CLIENT_ID; Google Sign-In is disabled.", true);
    if (!googleClientId) return;
    const render = () => {
      try {
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: credentialResponse => this.onGoogleCredential(credentialResponse)
        });
        google.accounts.id.renderButton(this.elements.googleButtonHost, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: 320
        });
      } catch (error) {
        this.setStatus("Failed to initialize Google Sign-In.", true);
      }
    };
    if (window.google && window.google.accounts && window.google.accounts.id) render();
    if (!window.google || !window.google.accounts || !window.google.accounts.id) window.addEventListener("load", render, { once: true });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  new LoginApp();
});
