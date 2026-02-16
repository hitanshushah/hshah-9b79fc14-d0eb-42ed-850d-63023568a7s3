if [ -n "$API_PUBLIC_URL" ]; then
  sed -i "s|__API_PUBLIC_URL__|$API_PUBLIC_URL|g" /usr/share/nginx/html/index.html
fi
exec nginx -g "daemon off;"
