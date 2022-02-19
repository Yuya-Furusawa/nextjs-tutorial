import Link from "next/link";
import { AppProps } from "next/app";

import "../styles/globals.css";

const MyApp = ({ Component, pageProps }: AppProps) => (
  <>
    <nav className="header">
      <Link href="/">
        <a>My Kitchen 🙋‍♀️</a>
      </Link>
    </nav>
    <main>
      <Component {...pageProps} />
    </main>
  </>
);

export default MyApp;
