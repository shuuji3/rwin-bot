FROM alekzonder/puppeteer

# Install Japanese fonts
USER root
RUN apt-get update && apt-get install -yq fonts-noto-cjk && apt-get clean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

USER pptruser
CMD ["node", "index.js"]
