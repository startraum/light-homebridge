FROM maxnowack/rpi-homebridge
MAINTAINER Max Nowack <max@unsou.de>

EXPOSE 2001 5353 9090 51826

RUN apt-get update && apt-get install wget make gcc libavahi-compat-libdnssd-dev libbluetooth-dev libcap2-bin libpcap-dev
RUN npm i -g --unsafe-perm noble
RUN setcap cap_net_raw+eip $(eval readlink -f `which node`)

WORKDIR /opt/light-homebridge
COPY dist dist
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm i -g --unsafe-perm

WORKDIR /usr/local/homebridge
