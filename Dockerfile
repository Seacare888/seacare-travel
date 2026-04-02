FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache bash
COPY package*.json ./
RUN npm install --legacy-peer-deps
ARG CACHE_BUST=1
COPY . .
RUN npm run build
EXPOSE 3000