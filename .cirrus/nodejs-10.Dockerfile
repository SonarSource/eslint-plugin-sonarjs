FROM gcr.io/language-team/base:latest

USER root

ENV NODE_VERSION v10.23.2

RUN  wget -U "nodejs" -q -O nodejs.tar.xz https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz \
    && tar -xJf "nodejs.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
    && rm nodejs.tar.xz \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs

ENV YARN_VERSION 1.22.5

RUN curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
      && mkdir -p /opt \
      && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
      && ln -s /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
      && ln -s /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
      && rm yarn-v$YARN_VERSION.tar.gz

RUN curl "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.3.0.2102.zip" -o /tmp/sonar-scanner.zip \
  && unzip -d /opt /tmp/sonar-scanner.zip \
  && mv /opt/sonar-scanner-4.3.0.2102 /opt/sonar-scanner \
  && rm /tmp/sonar-scanner.zip

USER sonarsource

ENV PATH "/opt/sonar-scanner/bin:${PATH}"
ENV SONARCLOUD_ANALYSIS true
