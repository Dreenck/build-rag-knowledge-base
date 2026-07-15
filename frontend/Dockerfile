# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Add build arguments for Vite environment variables
ARG VITE_API_URL

ENV VITE_API_URL=$VITE_API_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Serve Stage
FROM nginx:alpine

# Copy the custom NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app from the Build Stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
