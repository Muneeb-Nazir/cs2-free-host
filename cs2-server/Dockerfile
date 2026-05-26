FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive
RUN dpkg --add-architecture i386 &&     apt-get update &&     apt-get install -y --no-install-recommends     ca-certificates curl wget jq lib32gcc-s1 libc6-i386     libstdc++6 libstdc++6:i386 libcurl4-gnutls-dev bc     libncurses5:i386 libbz2-1.0:i386 netcat-traditional &&     rm -rf /var/lib/apt/lists/*
RUN useradd -m -s /bin/bash steam &&     mkdir -p /home/steam/serverfiles /home/steam/log/console /home/steam/log/script &&     chown -R steam:steam /home/steam
WORKDIR /home/steam
USER steam
RUN curl -Lo linuxgsm.sh https://linuxgsm.sh &&     chmod +x linuxgsm.sh &&     bash linuxgsm.sh cs2server &&     mkdir -p /home/steam/serverfiles/game/csgo/cfg
COPY --chown=steam:steam server.cfg.template /home/steam/serverfiles/game/csgo/cfg/server.cfg
COPY --chown=steam:steam entrypoint.sh /home/steam/entrypoint.sh
RUN chmod +x /home/steam/entrypoint.sh
EXPOSE 27015/udp 27015/tcp 27020/udp
ENTRYPOINT ["/home/steam/entrypoint.sh"]
