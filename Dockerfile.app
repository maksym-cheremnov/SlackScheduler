FROM node:16.17-alpine 
 
WORKDIR /app
 
COPY . . 
RUN npm install

EXPOSE 8080
CMD ["node", "app.js"]