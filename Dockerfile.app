FROM node:16.17-alpine 
 
WORKDIR /
 
COPY . . 
RUN npm install

EXPOSE 8081
CMD ["node", "app.js"]