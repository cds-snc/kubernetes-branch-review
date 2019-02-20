FROM docker:dind

# Install kubectl
ADD https://storage.googleapis.com/kubernetes-release/release/v1.13.3/bin/linux/amd64/kubectl /usr/local/bin/kubectl

ENV HOME=/config

RUN set -x && \
    apk add --no-cache curl ca-certificates && \
    chmod +x /usr/local/bin/kubectl

# Add kustomize
ADD https://github.com/kubernetes-sigs/kustomize/releases/download/v2.0.1/kustomize_2.0.1_linux_amd64 /usr/local/bin/kustomize

RUN chmod +x /usr/local/bin/kustomize

# Add Git
RUN apk add --no-cache \
  git

# Add Node
RUN apk add --no-cache \
  nodejs yarn

# Add app
WORKDIR /app
ADD . .

ENV NODE_ENV production
ENV PORT 3000

RUN yarn install

EXPOSE 3000

CMD ["sh", "entrypoint.sh"]
