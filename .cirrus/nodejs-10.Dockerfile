FROM gcr.io/language-team/base:latest

USER root

ENV NODE_VERSION v10.23.2

RUN  wget -U "nodejs" -q -O nodejs.tar.xz https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz \
    && tar -xJf "nodejs.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
    && rm nodejs.tar.xz \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs


RUN curl "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.3.0.2102.zip" -o /tmp/sonar-scanner.zip \
  && unzip -d /opt /tmp/sonar-scanner.zip \
  && mv /opt/sonar-scanner-4.3.0.2102 /opt/sonar-scanner \
  && rm /tmp/sonar-scanner.zip

RUN curl -Lo /usr/bin/jfrog https://releases-docker.jfrog.io/artifactory/jfrog-cli/v2/2.5.1/jfrog-cli-linux-amd64/jfrog

RUN chmod +x /usr/bin/jfrog

USER sonarsource

ENV PATH "/opt/sonar-scanner/bin:${PATH}"
ENV SONARCLOUD_ANALYSIS true
