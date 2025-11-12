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
                    
                    // 1. 현재 버전을 GIT_COMMIT의 앞 7자리로 정의합니다.
                    def version = env.GIT_COMMIT.substring(0, 7)
                    echo "Current Version (Git Hash): ${version}"
                    
                    withCredentials([usernamePassword(credentialsId: env.ALIYUN_CREDS_ID, 
                                                     usernameVariable: 'ALIYUN_KEY_ID', 
                                                     passwordVariable: 'ALIYUN_KEY_SECRET')]) {
                        
                        dir('dist') {
                            echo "--- Files in dist directory ---"
                            sh 'ls -l' 
                            echo "---------------------------------"

                            def localFile = '/voidx-ai-addon.es.js' // 0-index 무시 규칙
                            echo "Uploading to versioned path: /${version}/js/voidx-ai-addon.es.js"
                            aliyunOSSUpload(
                                accessKeyId: env.ALIYUN_KEY_ID,
                                accessKeySecret: env.ALIYUN_KEY_SECRET,
                                endpoint: "oss-ap-northeast-2.aliyuncs.com",
                                bucketName: bucketName,
                                localPath: localFile,
                                remotePath: "/${version}/voidx-ai-addon.es.js" // 0-index 무시 규칙 적용
                            )

                            // 3. [Upload 2] 'latest' 경로로 업로드
                            echo "Uploading to latest path: /latest/js/voidx-ai-addon.es.js"
                            aliyunOSSUpload(
                                accessKeyId: env.ALIYUN_KEY_ID,
                                accessKeySecret: env.ALIYUN_KEY_SECRET,
                                endpoint: "oss-ap-northeast-2.aliyuncs.com",
                                bucketName: bucketName,
                                localPath: localFile,
                                remotePath: '/latest/voidx-ai-addon.es.js'
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