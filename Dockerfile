# Use nginx for static web server
FROM nginx:alpine

# Install required packages for build script
RUN apk add --no-cache sed git bash

# Custom nginx configuration (for SPA)
COPY nginx.conf /etc/nginx/nginx.conf

# Copy build script and source files
COPY build.sh /tmp/build.sh
COPY src/ /tmp/src/
COPY .git/ /tmp/.git/

# Run build script to apply cache busting
WORKDIR /tmp
RUN chmod +x build.sh && \
    ./build.sh && \
    cp -r src/* /usr/share/nginx/html/ && \
    rm -rf /tmp/src /tmp/build.sh /tmp/.git

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
