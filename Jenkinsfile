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
                    
                    withCredentials([usernamePassword(credentialsId: env.ALIYUN_CREDS_ID, 
                                                     usernameVariable: 'ALIYUN_KEY_ID', 
                                                     passwordVariable: 'ALIYUN_KEY_SECRET')]) {
                        
                        dir('dist') { // 2. dist 디렉토리 내부에서 실행
                            echo "Uploading JS files to OSS bucket: ${bucketName}"

                            aliyunOSSUpload(
                                accessKeyId: env.ALIYUN_KEY_ID,
                                accessKeySecret: env.ALIYUN_KEY_SECRET,
                                
                                endpoint: "oss-ap-northeast-2.aliyuncs.com"
                                
                                bucketName: "voidx-ai-add-on",   
                                
                                localPath: '**/*.js',   
                                
                                remotePath: '/'          
                            )
                        }
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