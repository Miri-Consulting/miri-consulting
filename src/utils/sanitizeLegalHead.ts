export function sanitizeLegalHead(html: string): string {
  return html
    .replace(/<link href="https:\/\/cdn\.prod\.website-files\.com" rel="preconnect"\/>/, '')
    .replace(
      /<script>\s*\(function\(w,d,s,l,i\)[\s\S]*?GTM-N3PHMJQQ'\);\s*<\/script>/,
      '',
    )
    .replace(/<!-- Start cookieyes banner -->[\s\S]*?<!-- End cookieyes banner -->/, '')
    .replace(/<script src="[^"]*clarity_script[^"]*" type="text\/javascript"><\/script>/, '')
    .replace(/<script src="[^"]*n3phmjqq[^"]*" type="text\/javascript"><\/script>/, '');
}
