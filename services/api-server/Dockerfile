FROM node:alpine

RUN mkdir /db && chown -R node:node /db

USER node
WORKDIR /home/node/app
CMD ["node", "src/index.js"]
