#!/bin/bash

# Comprehensive Test Runner for Converge Application
# This script runs all tests across user service, chat service, and frontend

set -e

echo "🧪 Starting Comprehensive Test Suite for Converge Application"
echo "=============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to run tests for a service
run_service_tests() {
    local service_name=$1
    local service_path=$2
    
    print_status "Running tests for $service_name..."
    
    if [ ! -d "$service_path" ]; then
        print_error "$service_name directory not found at $service_path"
        return 1
    fi
    
    cd "$service_path"
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in $service_path"
        return 1
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies for $service_name..."
        npm install
    fi
    
    # Run tests
    if npm test -- --passWithNoTests 2>/dev/null; then
        print_success "$service_name tests passed!"
    else
        print_error "$service_name tests failed!"
        return 1
    fi
    
    cd - > /dev/null
}

# Function to run tests with coverage
run_service_tests_with_coverage() {
    local service_name=$1
    local service_path=$2
    
    print_status "Running tests with coverage for $service_name..."
    
    if [ ! -d "$service_path" ]; then
        print_error "$service_name directory not found at $service_path"
        return 1
    fi
    
    cd "$service_path"
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in $service_path"
        return 1
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies for $service_name..."
        npm install
    fi
    
    # Run tests with coverage
    if npm run test:cov -- --passWithNoTests 2>/dev/null; then
        print_success "$service_name tests with coverage passed!"
    else
        print_error "$service_name tests with coverage failed!"
        return 1
    fi
    
    cd - > /dev/null
}

# Main execution
main() {
    local start_time=$(date +%s)
    local failed_services=()
    
    print_status "Starting test execution at $(date)"
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "run-tests.sh" ]; then
        print_error "Please run this script from the converge project root directory"
        exit 1
    fi
    
    # Run User Service Tests
    echo "📋 User Service Tests"
    echo "---------------------"
    if ! run_service_tests "User Service" "user-service"; then
        failed_services+=("User Service")
    fi
    echo ""
    
    # Run Chat Service Tests
    echo "💬 Chat Service Tests"
    echo "---------------------"
    if ! run_service_tests "Chat Service" "chat-service"; then
        failed_services+=("Chat Service")
    fi
    echo ""
    
    # Run Frontend Tests
    echo "🎨 Frontend Tests"
    echo "-----------------"
    if ! run_service_tests "Frontend" "frontend"; then
        failed_services+=("Frontend")
    fi
    echo ""
    
    # Summary
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo "=============================================================="
    echo "🏁 Test Execution Summary"
    echo "=============================================================="
    echo "Total execution time: ${duration}s"
    echo ""
    
    if [ ${#failed_services[@]} -eq 0 ]; then
        print_success "All tests passed! 🎉"
        echo ""
        echo "✅ User Service: PASSED"
        echo "✅ Chat Service: PASSED"
        echo "✅ Frontend: PASSED"
        exit 0
    else
        print_error "Some tests failed:"
        for service in "${failed_services[@]}"; do
            echo "❌ $service: FAILED"
        done
        echo ""
        print_warning "Please check the test output above for details"
        exit 1
    fi
}

# Function to run tests with coverage
run_with_coverage() {
    local start_time=$(date +%s)
    local failed_services=()
    
    print_status "Starting test execution with coverage at $(date)"
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "run-tests.sh" ]; then
        print_error "Please run this script from the converge project root directory"
        exit 1
    fi
    
    # Run User Service Tests with Coverage
    echo "📋 User Service Tests (with coverage)"
    echo "-------------------------------------"
    if ! run_service_tests_with_coverage "User Service" "user-service"; then
        failed_services+=("User Service")
    fi
    echo ""
    
    # Run Chat Service Tests with Coverage
    echo "💬 Chat Service Tests (with coverage)"
    echo "-------------------------------------"
    if ! run_service_tests_with_coverage "Chat Service" "chat-service"; then
        failed_services+=("Chat Service")
    fi
    echo ""
    
    # Run Frontend Tests (coverage is built-in with react-scripts)
    echo "🎨 Frontend Tests (with coverage)"
    echo "---------------------------------"
    if ! run_service_tests "Frontend" "frontend"; then
        failed_services+=("Frontend")
    fi
    echo ""
    
    # Summary
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo "=============================================================="
    echo "🏁 Test Execution Summary (with coverage)"
    echo "=============================================================="
    echo "Total execution time: ${duration}s"
    echo ""
    
    if [ ${#failed_services[@]} -eq 0 ]; then
        print_success "All tests passed with coverage! 🎉"
        echo ""
        echo "✅ User Service: PASSED (coverage report generated)"
        echo "✅ Chat Service: PASSED (coverage report generated)"
        echo "✅ Frontend: PASSED (coverage report generated)"
        echo ""
        print_status "Coverage reports are available in each service's coverage directory"
        exit 0
    else
        print_error "Some tests failed:"
        for service in "${failed_services[@]}"; do
            echo "❌ $service: FAILED"
        done
        echo ""
        print_warning "Please check the test output above for details"
        exit 1
    fi
}

# Parse command line arguments
case "${1:-}" in
    --coverage|-c)
        run_with_coverage
        ;;
    --help|-h)
        echo "Converge Application Test Runner"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --coverage, -c    Run tests with coverage reports"
        echo "  --help, -h        Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                Run all tests"
        echo "  $0 --coverage     Run all tests with coverage"
        echo ""
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac
