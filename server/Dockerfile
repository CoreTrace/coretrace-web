FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

USER node
EXPOSE 5000
CMD ["node", "server.js"]
