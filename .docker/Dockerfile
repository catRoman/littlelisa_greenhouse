FROM fedora:latest

ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

ARG NODEJS_VERSION=20

RUN dnf -y update && \
    curl -fsSL "https://rpm.nodesource.com/setup_${NODEJS_VERSION}.x" | bash - && \
    dnf -y install nodejs && \
    dnf -y install @development-tools gcc-c++ && \
    dnf -y install \
        git \
	awk \
	wget \
        curl \
        unzip \
        java-21-openjdk-devel \
        automake \
        pkgconf \
        libtool \
	python3 \
	python3-pip \
        python3-devel \
    && npm install --global expo-cli eas-cli typescript \
    && dnf clean all && rm -rf /var/cache/dnf

# Step 5: Download, Build, and Install Watchman from Source Tarball
ARG WATCHMAN_VERSION_TAG=v2025.05.05.00

RUN echo "Installing Watchman version ${WATCHMAN_VERSION_TAG}..." && \
    WATCHMAN_ZIP_FILENAME="watchman-${WATCHMAN_VERSION_TAG}-linux.zip" && \
    WATCHMAN_DOWNLOAD_URL="https://github.com/facebook/watchman/releases/download/${WATCHMAN_VERSION_TAG}/${WATCHMAN_ZIP_FILENAME}" && \
    echo "Downloading Watchman binary from: ${WATCHMAN_DOWNLOAD_URL}" && \
    curl -fsSL -o "/tmp/${WATCHMAN_ZIP_FILENAME}" "${WATCHMAN_DOWNLOAD_URL}" && \
    mkdir -p "/tmp/watchman_extracted" && \
    unzip -q "/tmp/${WATCHMAN_ZIP_FILENAME}" -d "/tmp/watchman_extracted" && \
    WATCHMAN_BIN_DIR=$(find /tmp/watchman_extracted -maxdepth 3 -type f -name watchman -executable -printf '%h\n' | head -n 1) && \
    if [ -z "${WATCHMAN_BIN_DIR}" ]; then \
        echo "Error: Could not find Watchman 'bin' directory in extracted files." && \
        echo "Contents of /tmp/watchman_extracted:" && ls -lA /tmp/watchman_extracted && \
        exit 1; \
    fi && \
    echo "Found Watchman bin directory at: ${WATCHMAN_BIN_DIR}" && \
    echo "Copying Watchman binaries to /usr/local/bin/..." && \
    cp ${WATCHMAN_BIN_DIR}/* /usr/local/bin/ && \
    WATCHMAN_LIB_DIR=$(dirname ${WATCHMAN_BIN_DIR})/lib && \
    if [ -d "${WATCHMAN_LIB_DIR}" ]; then \
        echo "Copying Watchman libs from ${WATCHMAN_LIB_DIR} to /usr/local/lib/..." && \
        mkdir -p /usr/local/lib && \
        cp -a ${WATCHMAN_LIB_DIR}/* /usr/local/lib/; \
    else \
        echo "No separate lib directory found in Watchman archive structure."; \
    fi && \
    echo "Setting execute permissions..." && \
    chmod +x /usr/local/bin/watchman && \
    ( [ -f /usr/local/bin/watchman-make ] && chmod +x /usr/local/bin/watchman-make ) || true && \
    ( [ -f /usr/local/bin/watchman-replicate-subscription ] && chmod +x /usr/local/bin/watchman-replicate-subscription ) || true && \
    echo "Creating Watchman state directory..." && \
    mkdir -p /usr/local/var/run/watchman && \
    chmod 2777 /usr/local/var/run/watchman && \
    echo "Cleaning up temporary files..." && \
    rm -f "/tmp/${WATCHMAN_ZIP_FILENAME}" && \
    rm -rf "/tmp/watchman_extracted" && \
    echo "Verifying watchman installation..." && \
    watchman version || (echo "Watchman verification failed!" && exit 1)

#android_sdk setup
ENV ANDROID_SDK_ROOT="/opt/android-sdk"
RUN mkdir -p ${ANDROID_SDK_ROOT} && \
    cd /tmp && \
    wget https://dl.google.com/android/repository/platform-tools-latest-linux.zip && \
    sudo unzip platform-tools-latest-linux.zip -d ${ANDROID_SDK_ROOT} && \
    sudo rm platform-tools-latest-linux.zip && \
    echo "export PATH=\${PATH}:${ANDROID_SDK_ROOT}/platform-tools" | sudo tee /etc/profile.d/android-sdk-path.sh && \
    sudo chmod +x /etc/profile.d/android-sdk-path.sh && \
    sudo dnf clean all

# Step 4: Create a Non-Root User (Good Practice)
ARG USERNAME=dev
ARG USER_UID=1000
ARG USER_GID=${USER_UID}
# Fedora's useradd/groupadd are standard
RUN groupadd --gid ${USER_GID} ${USERNAME} && \
    useradd --uid ${USER_UID} --gid ${USER_GID} -m ${USERNAME} -s /bin/bash && \
    chown ${USERNAME}:${USERNAME} /usr/local/var/run/watchman

ENV PATH="/root/.cargo/bin:${PATH}"
ENV JAVA_HOME="/usr/lib/jvm/java-17-openjdk"

# Switch to the non-root user
USER ${USERNAME}

# Configure npm global path for the non-root user
ENV PATH="/home/${USERNAME}/.npm-global/bin:${PATH}"
RUN mkdir -p /home/${USERNAME}/.npm-global && npm config set prefix /home/${USERNAME}/.npm-global

# Step 5: Set Working Directory
WORKDIR /littlelisa

# Step 6: Expose Ports (Informational - actual mapping happens at runtime)
# Port for Metro Bundler
EXPOSE 8081

# Default command (keeps the container running if started without a specific command)
CMD ["tail", "-f", "/dev/null"]
