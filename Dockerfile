FROM node:10
WORKDIR ./src
COPY package*.json ./
RUN npm install
RUN npm install uikit
COPY . .
EXPOSE 8080
CMD [ "node", "server.js" ]
