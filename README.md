# 🚀 Node.js CI/CD Deployment with Jenkins, GitHub & AWS EC2

This project demonstrates how to deploy a **Node.js application** using a **Jenkins CI/CD pipeline**, with source code hosted on **GitHub**, Jenkins running on a **Master EC2 instance**, and deployment happening on a **Slave EC2 instance**.

---

## 🛠 Tools & Services Used

### 1. **GitHub**
- Source code repository.
- Webhook triggers Jenkins whenever code is pushed.

### 2. **Jenkins**
- CI/CD automation server.
- Installed on an EC2 instance (Jenkins Master).
- Configured with a Slave node (another EC2) for deployment.

### 3. **Amazon EC2 (t2.micro)**
- **Jenkins Master** → Runs Jenkins server.
- **Slave EC2** → Used as the deployment server where the Node.js app runs.

### 4. **Node.js & npm**
- Backend application framework.
- `npm` installs dependencies (`package.json`).

### 5. **PM2**
- Process manager for Node.js.
- Keeps app running in the background.
- Provides zero-downtime restarts.

### 6. **Jenkinsfile**
- Defines the pipeline as code.
- Automates cloning, uploading, installing, and starting the Node app.

---

## ⚙️ Architecture


---

## 📌 Prerequisites

1. **AWS EC2 Instances**
   - EC2 #1 → Jenkins Master (Ubuntu).
   - EC2 #2 → Slave / Deployment Server (Ubuntu).

2. **Install Dependencies**
   - On Jenkins Master:
     ```bash
     sudo apt update -y
     sudo apt install -y openjdk-11-jdk git maven
     ```
   - On Slave (deployment server):
     ```bash
     sudo apt update -y
     curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
     sudo apt install -y nodejs
     sudo npm install -g pm2
     ```

3. **Jenkins Plugins**
   - Git plugin
   - SSH Agent plugin
   - Pipeline plugin

4. **Credentials in Jenkins**
   - Add an SSH private key (`node-app`) for EC2 Slave authentication.

---

## 🚀 Jenkinsfile Pipeline

Your pipeline (`Jenkinsfile`) automates the deployment:

```groovy
pipeline {
    agent any

    environment {
        SERVER_IP      = '3.87.169.149'
        SSH_CREDENTIAL = 'node-app'
        REPO_URL       = 'https://github.com/govi888/git-ci-cd.git'
        BRANCH         = 'main'
        REMOTE_USER    = 'ubuntu'
        REMOTE_PATH    = '/home/ubuntu/node-app'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: "${BRANCH}", url: "${REPO_URL}"
            }
        }

        stage('Upload Files to EC2') {
            steps {
                sshagent([SSH_CREDENTIAL]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${SERVER_IP} 'mkdir -p ${REMOTE_PATH}'
                        scp -o StrictHostKeyChecking=no -r * ${REMOTE_USER}@${SERVER_IP}:${REMOTE_PATH}/
                    """
                }
            }
        }

        stage('Install Dependencies & Start App') {
            steps {
                sshagent([SSH_CREDENTIAL]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${REMOTE_USER}@${SERVER_IP} '
                            cd ${REMOTE_PATH} &&
                            npm install &&
                            pm2 start app.js --name node-app || pm2 restart node-app
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Application deployed successfully!'
        }
        failure {
            echo '❌ Deployment failed.'
        }
    }
}

