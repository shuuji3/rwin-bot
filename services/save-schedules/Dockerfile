FROM alekzonder/puppeteer

USER root
RUN mkdir /db && chown -R node:node /db

WORKDIR /app
USER node
CMD ["node", "src/index.js"]
