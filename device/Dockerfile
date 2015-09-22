FROM ubuntu

# Install dependencies
RUN apt-get update && apt-get install -y \
  git \
  nodejs \
  npm

RUN ln -s /usr/bin/nodejs /usr/local/bin/node

# Install Bower
RUN npm install -g bower bower-installer

ADD css /src/css
ADD fonts /src/fonts
ADD img /src/img
ADD js /src/js
ADD views /src/views
ADD bower.json /src/bower.json
ADD cpa-client.html /src/cpa-client.html
ADD cpa-device.html /src/cpa-device.html
ADD index.js /src/index.js
ADD package.json /src/package.json

WORKDIR /src

# Install Node.js dependencies
RUN npm install

# Install Bower dependencies
RUN bower --allow-root install

# Configure
ADD config.docker.js /src/config.js

# The Express app listens on port 8000 by default.
EXPOSE 8000

CMD ["npm", "start"]
