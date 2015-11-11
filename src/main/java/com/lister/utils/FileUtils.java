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
            //File f = new File(currentDirectory + File.separator + filePath);
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
    public static boolean removeListFile(String filePath) {
        try {
            //File f = new File(currentDirectory + File.separator + filePath);
            Path path = Paths.get(currentDirectory + File.separator + filePath);
            logger.info("removeListFile: path = " + path);
            logger.info("Files.exists(path) = " + Files.exists(path));
            if (Files.exists(path)) {
                logger.info("The file exists");
                Files.delete(path);
                logger.info("The file was removed");
                return true;
            }
        } catch (IOException e) {
            logger.error(errorMesage(e));
        }
        return false;
    }
    public static String getFileContent(String filePath) {
        try {
            File f = new File(currentDirectory + File.separator + filePath);
            Path path = Paths.get(currentDirectory + File.separator + filePath);
            if (f.exists()) {
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
            File f = new File(currentDirectory + File.separator + filePath);
            Path path = Paths.get(currentDirectory + File.separator + filePath);
            if (f.exists()) {
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
