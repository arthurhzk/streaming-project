# Infrastructure (Terraform)

Terraform configuration following best practices: modular design with environment separation.

## Structure

```
infra/
├── modules/              # Reusable infrastructure components
│   ├── storage/          # S3 bucket
│   ├── dynamodb/         # DynamoDB videos table
│   └── iam/              # IAM user and policy for video service
├── environments/         # Environment-specific root modules
│   └── dev/              # Development environment
│       ├── main.tf       # Module orchestration
│       ├── variables.tf
│       ├── outputs.tf
│       ├── versions.tf    # Terraform & provider versions
│       ├── providers.tf   # Provider configuration
│       ├── backend.tf    # State backend (optional)
│       └── dev.tfvars    # Variable values for dev
└── README.md
```

## Usage

### Deploy development environment

```bash
cd infra/environments/dev
terraform init
terraform plan -var-file=dev.tfvars
terraform apply -var-file=dev.tfvars
```

**Region mismatch?** If your AWS credentials default to another region (e.g. `ap-southeast-2`) but you want resources in `ap-southeast-2`, run:

```bash
AWS_DEFAULT_REGION=ap-southeast-2 terraform apply -var-file=dev.tfvars
```

Or use the helper script:

```bash
./apply.sh plan -var-file=dev.tfvars
./apply.sh apply -var-file=dev.tfvars
```

### Add a new environment (e.g. staging)

1. Copy `environments/dev` to `environments/staging`
2. Update `staging.tfvars` with staging-specific values
3. Configure a separate backend/state for staging
4. Run `terraform init` and `terraform apply` from `environments/staging`

## Modules

- **storage** – S3 bucket for media/assets
- **dynamodb** – Videos table with GSIs for owner, slug, and category queries
- **iam** – IAM user and policy for video-service DynamoDB access
