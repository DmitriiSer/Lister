package com.lister.utils;

import static com.lister.utils.Utils.errorMesage;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.FileAttribute;
import javax.servlet.http.HttpServlet;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 *
 * @author dmitr
 */
public class FileUtils {
    private static final Logger logger = LogManager.getLogger(FileUtils.class);
    private static String currentDirectory;
    private static final Charset charset = Charset.forName("UTF-8");

    public static void setCurrentDirectory(String realPath) {
        currentDirectory = realPath;
    }
    public static boolean createListFile(String filePath) {
        try {
            Path path = Paths.get(currentDirectory + File.separator + filePath);
            if (!Files.exists(path)) {
                Path parentDir = path.getParent();
                // if there is a parent folder
                if (parentDir != null) {
                    Files.createDirectories(parentDir);
                }
                Files.createFile(path);
                try (BufferedWriter writer = Files.newBufferedWriter(path, charset)) {
                    writer.write("{}", 0, 2);
                } catch (IOException e) {
                    throw e;
                }
                return true;
            }
        } catch (IOException e) {
            logger.error(errorMesage(e));
        }
        return false;
    }
    public static void renameListFile(String username, String oldListTitle, String newListTitle) throws IOException {
        try {
            Path oldFilePath = Paths.get(currentDirectory + File.separator + "data" + File.separator + username + "_" + oldListTitle + ".dt");
            Path newFilePath = Paths.get(currentDirectory + File.separator + "data" + File.separator + username + "_" + newListTitle + ".dt");
            if (Files.exists(oldFilePath)) {
                // rename file
                Files.move(oldFilePath, newFilePath);
            } else {
                throw new IOException("File with name '" + oldFilePath.getFileName() + "' was not found");
            }
            logger.info("The file with name '" + oldFilePath.getFileName() + "' was renamed to '" + newFilePath.getFileName() + "'");
        } catch (IOException e) {
            logger.error(errorMesage(e));
            throw new IOException(e.getMessage());
        }
    }
    public static boolean removeListFile(String filePath) {
        try {
            Path path = Paths.get(currentDirectory + File.separator + filePath);
            if (Files.exists(path)) {
                Files.delete(path);
            }
            logger.info("The file was removed");
            return true;
        } catch (IOException e) {
            logger.error(errorMesage(e));
        }
        return false;
    }
    public static String getFileContent(String filePath) {
        try {
            Path path = Paths.get(currentDirectory + File.separator + filePath);
            if (Files.exists(path)) {
                try (BufferedReader reader = Files.newBufferedReader(path, charset)) {
                    String line = null;
                    StringBuilder sb = new StringBuilder();
                    while ((line = reader.readLine()) != null) {
                        sb.append(line);
                    }
                    return sb.toString();
                } catch (IOException e) {
                    throw e;
                }
            } else {
                Files.createFile(path);
                try (BufferedWriter writer = Files.newBufferedWriter(path, charset)) {
                    writer.write("{}", 0, 2);
                    return "{}";
                } catch (IOException e) {
                    throw e;
                }
            }
        } catch (IOException e) {
            logger.error(errorMesage(e));
        }
        return "";
    }
    public static void setFileContent(String filePath, String listContent) {
        try {
            Path path = Paths.get(currentDirectory + File.separator + filePath);
            if (Files.exists(path)) {
                try (BufferedWriter writer = Files.newBufferedWriter(path, charset)) {
                    writer.append(listContent);
                } catch (IOException e) {
                    throw e;
                }
            } else {
                throw new IOException("File with name \"" + filePath + "\" was not found");
            }
        } catch (IOException e) {
            logger.error(errorMesage(e));
        }
    }
}
