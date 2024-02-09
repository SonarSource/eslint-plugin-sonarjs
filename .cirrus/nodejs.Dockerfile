ARG CIRRUS_AWS_ACCOUNT=275878209202
FROM ${CIRRUS_AWS_ACCOUNT}.dkr.ecr.eu-central-1.amazonaws.com/base:j17-latest

USER root

ARG NODE_VERSION=18
ARG SCANNER_VERSION=5.0.1.3006

RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && apt-get install -y nodejs=${NODE_VERSION}.*

RUN curl "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SCANNER_VERSION}.zip" -o /tmp/sonar-scanner.zip \
  && unzip -d /opt /tmp/sonar-scanner.zip \
  && mv /opt/sonar-scanner-${SCANNER_VERSION} /opt/sonar-scanner \
  && rm /tmp/sonar-scanner.zip

USER sonarsource

ENV PATH "/opt/sonar-scanner/bin:${PATH}"
ENV SONARCLOUD_ANALYSIS true
