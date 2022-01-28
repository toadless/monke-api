FROM node:12.18.1
WORKDIR /home/monkeapi/
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
ENTRYPOINT npm run start