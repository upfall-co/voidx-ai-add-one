pipeline {
    agent any 

   environment {
        OSS_BUCKET = 'oss://voidx-ai-add-on' 
        CDN_DOMAIN = 'https://addon-cdn.voidx.ai'
        ALIYUN_CREDS_ID = 'aliyun-oss-creds' 
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

       stage('Upload to OSS') {
            steps {
                script {
                    def bucketName = env.OSS_BUCKET.replace('oss://', '')
                    dir('dist') {
                        echo "Uploading JS files to OSS bucket: ${bucketName}"

                        aliyunOSSUpload(
                            credentialsId: env.ALIYUN_CREDS_ID, 
                            bucketName: bucketName,   
                            filesPath: '**/*.js',   
                            targetPath: '/'          
                        )
                    }
                }
            }
        }
    }
    
    post {
        always {
            deleteDir()
        }
    }
}