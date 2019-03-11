# Elenchos

[![Phase](https://img.shields.io/badge/Phase-Alpha-f90277.svg)](https://digital.canada.ca/products/) [![Maintainability](https://api.codeclimate.com/v1/badges/9a136d7466cf164780f3/maintainability)](https://codeclimate.com/github/cds-snc/elenchos/maintainability) [![Total alerts](https://img.shields.io/lgtm/alerts/g/cds-snc/elenchos.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/cds-snc/elenchos/alerts/)

### :exclamation: This tool is a proof-of-concept, do not use for important workloads

### Purpose

The purpose of this tool is to create Kubernetes review (also known as staging) applications that reflect the code on a Git branch using an isolated Kubernetes cluster. This allows you to test and review your application in an interactive environment without solely relying on interpreting the code changes in a branch. We also want all this information to be easily accessible through GitHub.

### How do I use this?

All you need is to include an `elenchos.json` configuration file (See Configuration below) in your repositories root and install the GitHub application found here: _Coming soon!_

You also need to use [Kustomize](https://github.com/kubernetes-sigs/kustomize) to create a specific overlay for your staging clusters that work on our cloud provider of choice which is currently: [**Digital Ocean**](https://www.digitalocean.com/products/kubernetes/)

### Configuration

To ensure the application works you need to provide two pieces of information:

- An object of all your docker files in a `key -> value` format representing `name -> location` in relation to the root of your repository.
- The location of the [Kustomize](https://github.com/kubernetes-sigs/kustomize) overlay you want to apply.

Your file might look something like [this](https://github.com/cds-snc/etait-ici/blob/master/elenchos.json):

```
{
  "dockerfiles": {
    "cdssnc/etait-ici": "."
  },
  "overlay": "manifests/overlays/elenchos"
}
```

### How is this different to the X other review workflows that exist out there?

At this point in time most review solutions take one of two approaches:

1. They only allow you to review one component of your application. For example [Heroku review apps](https://devcenter.heroku.com/articles/github-integration-review-apps), allows you to easily build and show the UI of your application by adapting your app to their deploy process. This works great if you only want to test one part of your app, but does not allow you to deploy multiple components like a database or anything else you would expect to find in a Kubernetes cluster.

2. They make use of existing cluster infrastructure to deploy a "staging cluster". This is a great solution that allows you to test all the components of your app, but what happens if you have three or four Git branches on the go? You have the same application living on the same cluster four times, which brings it's own host of problems.

### Our approach

We always dreamed of having a process similar to [Heroku review apps](https://devcenter.heroku.com/articles/github-integration-review-apps), where each branch gets it's own isolated instance and deployment - however, the cluster creation time on cloud providers made user experience terrible. This has changed recently and we are able to deploy a review cluster within five minutes of opening a new pull request.

#### Workflow

Pull requests in GitHub have three stages in their life-cycle:

- Opened
- Updated
- Closed

As a result we have broken down how the code handles each of these events:

##### Opened

1. User creates new pull request
2. Application requests a new cluster instance is created
3. Application retrieves cluster credentials
4. Application checks out code from GitHub
5. Application builds all docker files locally with the new code
6. Application pushes docker files to repository
7. Kustomize applies the new images on the overlay
8. Kubectl deploys the new overlay
9. A new load balancer is created and we wait for the IP
10. Application posts IP and success state back to GitHub

##### Updated

1. User updates pull request
2. Application retrieves cluster credentials
3. Application checks out code from GitHub
4. Application builds all docker files locally with the new code
5. Application pushes docker files to repository
6. Kustomize applies the new images on the overlay
7. Kubectl deploys the new overlay
8. Application posts success state back to GitHub

##### Closed

1. Application deletes all local checked out code
2. Application deletes all docker images
3. Application deletes load balancer
4. Application deletes cluster
5. Application notifies GitHub.

Here is a diagram of the same information:

![Elenchos-work-flow](https://user-images.githubusercontent.com/867334/54051171-29548d00-41af-11e9-8e8f-12d11b3d2f97.png)

### Implementation

The application runs on Google GKE.

### Questions?

Please contact us through any of the multiple ways listed on our [website](https://digital.canada.ca/).
