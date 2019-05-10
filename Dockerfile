FROM gcr.io/cloud-builders/kubectl@sha256:7fd11ee400cb396737d525377b9706dbaf742c07b3456f04dedbb0ff5a819ea6

# Add node and npm
RUN curl -sL https://deb.nodesource.com/setup_12.x -o nodesource_setup.sh && bash nodesource_setup.sh

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl=7.47.0-1ubuntu2.12 \
    ca-certificates=20170717~16.04.2 \
    nodejs=12.2.0-1nodesource1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Add kustomize
ADD https://github.com/kubernetes-sigs/kustomize/releases/download/v2.0.1/kustomize_2.0.1_linux_amd64 /usr/local/bin/kustomize

RUN chmod +x /usr/local/bin/kustomize

# Add app
WORKDIR /app
COPY . .

ENV NODE_ENV production
ENV PORT 3000

RUN npm install

EXPOSE 3000

ENTRYPOINT ["sh", "entrypoint.sh"]