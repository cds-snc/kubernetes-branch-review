FROM docker:18.09.3-dind

ENV HOME=/config

RUN set -x && \
    apk add --no-cache \
    curl=7.61.1-r2 \
    ca-certificates=20171114-r3 \
    git=2.18.1-r0 \
    nodejs=8.14.0-r0 \
    yarn=1.7.0-r0

# Clean up
RUN rm -rf /var/cache/apk/*

# Install kubectl
ADD https://storage.googleapis.com/kubernetes-release/release/v1.13.3/bin/linux/amd64/kubectl /usr/local/bin/kubectl

# Add kustomize
ADD https://github.com/kubernetes-sigs/kustomize/releases/download/v2.0.1/kustomize_2.0.1_linux_amd64 /usr/local/bin/kustomize

RUN chmod +x /usr/local/bin/kustomize && \
chmod +x /usr/local/bin/kubectl

# Add app
WORKDIR /app
COPY . .

ENV NODE_ENV production
ENV PORT 3000

RUN yarn install

EXPOSE 3000

CMD ["sh", "entrypoint.sh"]
