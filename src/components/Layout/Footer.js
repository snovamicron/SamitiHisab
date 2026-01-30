import React from "react";
import Container from "./Container";
import "./Footer.css";

/**
 * Footer component
 * Minimal footer with copyright info
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <Container>
        <div className="footer__inner">
          <p className="footer__text">
            © {currentYear} SamitiHisab. All rights reserved.
          </p>
          <p className="footer__tagline">
            Simple loan repayment schedules for Mohila Samiti & cooperative
            groups.
            <br />
            SamitiHisab বিশেষভাবে মহিলাদের পরিচালিত সমিতি (Mohila Samiti) এবং
            কো-অপারেটিভ ঋণ গ্রুপের জন্য তৈরি।
          </p>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
