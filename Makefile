.PHONY: install dev build preview clean lint type-check deploy-local help

# Default target
help:
	@echo "SG FIRE Calculator - Available commands:"
	@echo ""
	@echo "  make install      - Install dependencies"
	@echo "  make dev          - Start development server"
	@echo "  make build        - Build for production"
	@echo "  make preview      - Preview production build locally"
	@echo "  make lint         - Run ESLint"
	@echo "  make type-check   - Run TypeScript type checking"
	@echo "  make clean        - Remove build artifacts"
	@echo "  make deploy-local - Build and preview GitHub Pages version"
	@echo ""

# Install dependencies
install:
	npm install

# Start development server
dev:
	npm run dev

# Build for production
build:
	npm run build

# Build for GitHub Pages
build-gh:
	npm run build:gh-pages

# Preview production build
preview:
	npm run preview

# Run linter
lint:
	npm run lint

# Type check
type-check:
	npx tsc --noEmit

# Clean build artifacts
clean:
	rm -rf dist node_modules/.vite

# Build and preview GitHub Pages version locally
deploy-local: build-gh
	@echo "Starting local preview of GitHub Pages build..."
	npx vite preview --base /sg-fire-calculator/

# Full check before commit
check: type-check lint
	@echo "All checks passed!"
