FROM gcr.io/cloud-builders/kubectl

# Add node and yarn
RUN curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh && bash nodesource_setup.sh

RUN apt-get update && \
    apt-get -y install \
    curl \
    ca-certificates \
    nodejs 

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

CMD ["sh", "entrypoint.sh"]