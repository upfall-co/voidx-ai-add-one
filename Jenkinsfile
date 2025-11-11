pipeline {
    agent any 

    environment {
        ALIYUN_CREDS_ID = 'LTAI5tCrPDaDWZsjM7GNbigM' 
        OSS_BUCKET = 'oss://voidx-ai-add-on'
        CDN_DOMAIN = 'https://addon-cdn.voidx.ai'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/upfall-co/voidx-ai-add-on.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }
    
    post {
        always {
            // 빌드 완료 후 워크스페이스 정리
            deleteDir()
        }
    }
}