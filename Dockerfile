FROM node:lts

WORKDIR /home/node/app
COPY . /home/node/app

RUN chown node:node -R /home/node
USER node
RUN npm install

EXPOSE 3000

CMD [ "npm", "run", "dockerstart" ]
