function pathOf(session) {
  if (typeof session?.name !== "string" || !session.name) throw new TypeError("remote session name is required");
  if (!Number.isInteger(session.port) || session.port < 1 || session.port > 65535) throw new TypeError("remote session port is required");
  return `/bridge/${session.name}`;
}

function sharedHeader(origin) {
  if (typeof origin !== "string" || !origin.startsWith("https://")) throw new TypeError("instance origin must be HTTPS");
  return origin;
}

function apache(sessions, origin) {
  const originExpression = `expr=%{HTTP:Origin} == '${origin}'`;
  const routes = sessions.map((session) => {
    const path = `${pathOf(session)}/`, upstream = `http://127.0.0.1:${session.port}/`;
    return [
      `<Location "${path}">`,
      "  AuthType Basic",
      "  AuthName \"Agent M jump host\"",
      "  AuthUserFile /etc/agent-m/jump-host.htpasswd",
      "  Require valid-user",
      "</Location>",
      `ProxyPass \"${path}\" \"${upstream}\"`,
      `ProxyPassReverse \"${path}\" \"${upstream}\"`,
    ].join("\n");
  });
  return [
    "# HTTPS only: use a trusted certificate from an authority the browser trusts; self-signed certificates do not work.",
    "<VirtualHost *:443>",
    "  SSLEngine on",
    "  SSLCertificateFile /etc/agent-m/jump-host-cert.pem",
    "  SSLCertificateKeyFile /etc/agent-m/jump-host-key.pem",
    `  Header always set Access-Control-Allow-Origin \"${origin}\" \"${originExpression}\"`,
    `  Header always set Access-Control-Allow-Methods \"GET, POST, OPTIONS\" \"${originExpression}\"`,
    `  Header always set Access-Control-Allow-Headers \"Authorization, Content-Type, X-Agent-M-Bridge-Token\" \"${originExpression}\"`,
    "  RewriteEngine On",
    `  RewriteCond %{HTTP:Origin} !^${origin.replace(/[./]/g, "\\$&")}$`,
    "  RewriteCond %{REQUEST_METHOD} =OPTIONS",
    "  RewriteRule ^/bridge/ - [R=403,L]",
    `  RewriteCond %{HTTP:Origin} ^${origin.replace(/[./]/g, "\\$&")}$`,
    "  RewriteCond %{REQUEST_METHOD} =OPTIONS",
    "  RewriteRule ^/bridge/ - [R=204,L]",
    ...routes.map((route) => `  ${route.replace(/\n/g, "\n  ")}`),
    "</VirtualHost>",
  ].join("\n");
}

function nginx(sessions, origin) {
  const blocks = sessions.map((session) => {
    const path = `${pathOf(session)}/`, upstream = `http://127.0.0.1:${session.port}/`;
    return [
      `location ${path} {`,
      "  auth_basic \"Agent M jump host\";",
      "  auth_basic_user_file /etc/agent-m/jump-host.htpasswd;",
      `  if ($http_origin != \"${origin}\") { return 403; }`,
      "  if ($request_method = OPTIONS) {",
      `    add_header Access-Control-Allow-Origin \"${origin}\" always;`,
      "    add_header Access-Control-Allow-Methods \"GET, POST, OPTIONS\" always;",
      "    add_header Access-Control-Allow-Headers \"Authorization, Content-Type, X-Agent-M-Bridge-Token\" always;",
      "    return 204;",
      "  }",
      `  add_header Access-Control-Allow-Origin \"${origin}\" always;`,
      `  proxy_pass ${upstream};`,
      "}",
    ].join("\n");
  });
  return [
    "# HTTPS only: use a trusted certificate from an authority the browser trusts; self-signed certificates do not work.",
    "server {",
    "  listen 443 ssl;",
    "  ssl_certificate /etc/agent-m/jump-host-cert.pem;",
    "  ssl_certificate_key /etc/agent-m/jump-host-key.pem;",
    ...blocks.map((block) => `  ${block.replace(/\n/g, "\n  ")}`),
    "}",
  ].join("\n");
}

export function proxyConfiguration(jumpHost, sessions, instanceOrigin, server) {
  const origin = sharedHeader(instanceOrigin);
  if (!Array.isArray(sessions) || sessions.length === 0) throw new TypeError("at least one remote session is required");
  if (server === "apache") return apache(sessions, origin);
  if (server === "nginx") return nginx(sessions, origin);
  throw new TypeError("server is apache or nginx");
}
