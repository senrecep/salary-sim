# Use nginx for static web server
FROM nginx:alpine

# Custom nginx configuration (for SPA)
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static files to nginx
COPY src/ /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
