FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install
# Install PM2 globally
RUN npm install pm2 -g

COPY . .

EXPOSE 5000

# Use pm2-runtime to keep the container running
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
