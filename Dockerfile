FROM node:latest
RUN npm install -g yo

RUN adduser --disabled-password --gecos "" yeoman && \
  echo "yeoman ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# set HOME so 'npm install' and 'bower install' don't write to /
ENV HOME /home/yeoman

RUN mkdir /src && chown yeoman:yeoman /src
WORKDIR /src
ADD . /src
RUN npm link

# Always run as the yeoman user
USER yeoman

VOLUME /data
WORKDIR /data
ENTRYPOINT ["yo"]
CMD ["xl-release-plugin"]

